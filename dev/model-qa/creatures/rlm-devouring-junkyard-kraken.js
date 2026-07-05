/* dev/model-qa/creatures/rlm-devouring-junkyard-kraken.js — DEVOURING JUNKYARD KRAKEN (ash realm,
   Huge, CR 13). Read: a flooded-scrapyard tentacled mutant — a bulbous rust-mottled mantle (squid-
   mantle silhouette, scrap-plate fused into the hide) sitting low over a cluster of tentacles that
   splay + curl onto the disc, jagged rebar-and-scrap shards embedded along the tentacles' outer
   ridges, a beaked maw + heavy brow ridge low on the mantle's underside. NO eye quads — the brow
   ridge is shape, not a painted eye. Whole-object grammar: one function, one merged frame, no
   anchors. Huge: base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildDevouringJunkyardKraken(){
  /* ---------- PALETTE (VS-desaturated rust-mottled hide, oil-slick dark, scrap-plate fused-in) ---- */
  const P = {
    hide:0x454138, hideDk:0x2e2b24, hideLt:0x585346,
    rust:0x6c3a20, rustDk:0x452414,               // rust mottle patches
    oil:0x28241e, oilLt:0x3a352c,                  // oil-slick dark underside
    scrap:0x585449, scrapDk:0x38352c,              // scrap-plate fused into the hide
    sucker:0x726256, suckerDk:0x342e26,
    brow:0x201d18, maw:0x14110d, beak:0x0a0806,
    disc:0x2e2b22, discTop:0x3a362b,
  };
  setChannels({
    [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin',
    [P.rust]:'skin', [P.rustDk]:'skin',
    [P.oil]:'skin', [P.oilLt]:'skin',
    [P.scrap]:'metal', [P.scrapDk]:'metal',
    [P.sucker]:'skin', [P.suckerDk]:'skin',
    [P.brow]:'bone', [P.maw]:'skin', [P.beak]:'bone',
    [P.disc]:'stone', [P.discTop]:'stone',
  });

  /* ---------- MANTLE — bulbous ovoid mass, pointed top, rust-mottled + scrap-plate fused patches. --- */
  {
    const n = 10, ph = Math.PI/n;
    const bands = [
      { y:0.48, rx:0.28, rz:0.30, hex:P.hideDk },
      { y:0.64, rx:0.37, rz:0.39, hex:P.hide },
      { y:0.90, rx:0.41, rz:0.43, hex:P.rust },
      { y:1.14, rx:0.33, rz:0.35, hex:P.hide },
      { y:1.32, rx:0.20, rz:0.22, hex:P.rustDk },
      { y:1.45, rx:0.09, rz:0.10, hex:P.hideDk },
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.55,0), P.hideDk);
    capFan(rings[0], V(0,0.36,0), P.hideDk, true);

    /* rust mottle blotches */
    const blot=(cy,cz,cx,rw,rh,hex)=>{
      quad(V(cx-rw,cy-rh,cz), V(cx+rw,cy-rh,cz), V(cx+rw*0.7,cy+rh,cz+rh*0.4), V(cx-rw*0.7,cy+rh,cz+rh*0.4), hex, 0.06);
    };
    blot(0.94, 0.38,  0.16, 0.12, 0.15, P.rustDk);
    blot(0.78,-0.34, -0.18, 0.14, 0.13, P.rust);
    blot(1.08, 0.10,  0.28, 0.09, 0.11, P.rustDk);
    /* scrap-plate fused into the hide — irregular metal patches embedded in the mantle */
    quad(V(-0.22,1.00,0.24), V(-0.06,1.02,0.30), V(-0.08,0.86,0.28), V(-0.24,0.84,0.22), P.scrap, 0.05);
    quad(V(0.10,0.70,-0.30), V(0.24,0.72,-0.26), V(0.22,0.58,-0.24), V(0.08,0.56,-0.28), P.scrapDk, 0.05);
  }

  /* ---------- BROW RIDGE + BEAKED MAW — low on the mantle's front-underside. NO eye quads. ---------- */
  {
    const bz = 0.36, by = 0.56;
    quad(V(-0.24,by+0.06,bz-0.02), V(0.24,by+0.06,bz-0.02), V(0.20,by+0.15,bz+0.06), V(-0.20,by+0.15,bz+0.06), P.brow, 0.05);
    for(const s of [-1,1]){
      const cx = s*0.14;
      quad(V(cx-0.050,by-0.02,bz+0.03), V(cx+0.050,by-0.02,bz+0.03), V(cx+0.041,by+0.06,bz+0.07), V(cx-0.041,by+0.06,bz+0.07), P.brow, 0.03);
      quad(V(cx-0.032,by+0.01,bz+0.05), V(cx+0.032,by+0.01,bz+0.05), V(cx+0.026,by+0.04,bz+0.08), V(cx-0.026,by+0.04,bz+0.08), P.maw, 0.0);
    }
    const bkTop = V(0, by-0.05, bz+0.09);
    const bkL   = V(-0.09, by-0.13, bz+0.13);
    const bkR   = V( 0.09, by-0.13, bz+0.13);
    const bkTip = V(0, by-0.24, bz+0.18);
    quad(bkTop, bkR, bkTip, bkL, P.maw, 0.04);
    quad(bkL, bkTip, bkR, bkTop, P.beak, 0.06);
    quad(V(-0.06,by-0.15,bz+0.14), V(0.06,by-0.15,bz+0.14), V(0,by-0.22,bz+0.18), V(0,by-0.22,bz+0.18), P.beak, 0.05);
  }

  /* ---------- TENTACLES — 8, root at the mantle base flare, splay out, some raised/curled, most
     sprawl flat onto the disc; scrap-shard fins jut off the outer ridge of each tentacle. ---------- */
  const NT = 8;
  for(let i=0;i<NT;i++){
    const ang = (i/NT)*Math.PI*2 + 0.18;
    const dirX = Math.cos(ang), dirZ = Math.sin(ang);
    const raised = (i % 3 === 0);
    const root = V(dirX*0.22, 0.46, dirZ*0.22);

    let pts;
    if(raised){
      pts = [
        root,
        V(dirX*0.38, 0.38, dirZ*0.38),
        V(dirX*0.52, 0.50, dirZ*0.52),
        V(dirX*0.54, 0.74, dirZ*0.54),
        V(dirX*0.45, 0.94, dirZ*0.45),
        V(dirX*0.28, 1.04, dirZ*0.28),
        V(dirX*0.16, 0.98, dirZ*0.16),
      ];
    } else {
      pts = [
        root,
        V(dirX*0.40, 0.24, dirZ*0.40),
        V(dirX*0.56, 0.13, dirZ*0.56),
        V(dirX*0.58, 0.070, dirZ*0.58),
        V(dirX*0.50, 0.042, dirZ*0.50 + (i%2? 0.07:-0.07)),
        V(dirX*0.38, 0.032, dirZ*0.38 + (i%2? 0.14:-0.14)),
      ];
    }
    const radii = [0.122, 0.104, 0.080, 0.056, 0.036, 0.022, 0.011].slice(0, pts.length);

    const NSEG = 7;
    const rings = [];
    for(let k=0;k<pts.length;k++){
      const nxt = pts[Math.min(k+1, pts.length-1)];
      const prv = pts[Math.max(k-1, 0)];
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      rings.push(ring(pts[k], axis, radii[k], radii[k]*0.92, NSEG, Math.PI/NSEG + i*0.3));
    }
    const bandHex = (b)=> (b < rings.length/2) ? (i%2? P.hide : P.hideDk) : (i%2? P.rust : P.rustDk);
    stitch(rings, bandHex);
    capFan(rings[0], root.clone().add(V(0,-0.03,0)), P.hideDk, true);
    capFan(rings.at(-1), pts.at(-1).clone().addScaledVector(new THREE.Vector3(dirX,0,dirZ), 0.02), P.hideDk);

    /* SUCKERS along the underside */
    for(let s=2;s<pts.length-1;s++){
      const c = pts[s].clone();
      const down = V(0,-1,0);
      const along = new THREE.Vector3().subVectors(pts[Math.min(s+1,pts.length-1)], pts[s-1]).normalize();
      const side = new THREE.Vector3().crossVectors(down, along).normalize();
      const r = radii[s]*0.55;
      const base = c.clone().addScaledVector(down, radii[s]*0.85);
      const a=base.clone().addScaledVector(side,-r), b=base.clone().addScaledVector(side,r);
      const a2=a.clone().addScaledVector(along,r*0.7), b2=b.clone().addScaledVector(along,r*0.7);
      quad(a,b,b2,a2, s%2? P.sucker : P.suckerDk, 0.05);
    }
    /* jagged scrap-shard fin jutting off the outer ridge, every other tentacle */
    if(i%2===0 && pts.length>3){
      const s = Math.floor(pts.length/2);
      const c = pts[s].clone();
      const out = c.clone().normalize();
      const finBase = c.clone().addScaledVector(out, radii[s]*0.9);
      const finTip  = finBase.clone().add(V(out.x*0.14, 0.10, out.z*0.14));
      tube(finBase, finTip, 0.02, 0.004, 4, P.scrapDk, {capB:{hex:P.scrapDk, lift:0.004}});
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
