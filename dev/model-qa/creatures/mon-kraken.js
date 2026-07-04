/* dev/model-qa/creatures/mon-kraken.js — the KRAKEN (bespoke CEPHALOPOD, Gargantuan Monstrosity).
   docs/CREATURE-MODELS-P2.md Wave 2 — seeds nothing new (worm/tube base already exists from
   mon-snake.js's tapered-tube-chain technique, reused here for the tentacles), but is itself the
   biggest base disc in the roster (discR 0.72). The bestiary kraken is a titanic ocean horror:
   a large bulbous MANTLE (squid/octopus head-body, pointed at the top) sitting low over a cluster
   of long muscular TENTACLES that splay out and curl onto the disc — some raised and curling up,
   some sprawling flat. 8 tentacles (cephalopod count read clearly even at a glance), tapering to
   curled tips, small darker sucker-quads along the underside. A beaked maw + heavy brow ridge sit
   low on the mantle's underside. Deep bruised blue-grey / oxblood-mottled hide (VS-desaturated,
   oceanic and dark), paler sucker rows. NO eye quads — the brow ridge is shape, not a painted eye.
   Whole-object grammar: one function, one merged geometry frame, no anchors. Tentacles curl within/
   onto the r=0.72 disc (the biggest base in the roster). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildKraken(){
  /* ---------- PALETTE (VS desaturated — bruised blue-grey hide, oxblood mottle, pale suckers) ---------- */
  const P = {
    hide:0x3c4550, hideDk:0x282f38, hideLt:0x505a64,        // bruised blue-grey mantle/tentacle hide
    mottleA:0x4a3a3c, mottleB:0x5c4448,                      // oxblood mottle patches
    belly:0x6e6560, bellyDk:0x554e4a,                        // paler underside
    sucker:0x847368, suckerDk:0x3a332e,                       // pale sucker discs + dark rims
    brow:0x232a32, maw:0x18130f, beak:0x0e0c0a,               // heavy brow ridge, dark maw, black beak
    disc:0x2c3238, discTop:0x3a424a,                          // dark oceanic stone-disc (wet rock read)
  };
  setChannels({
    [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin',
    [P.belly]:'skin', [P.bellyDk]:'skin',
    [P.sucker]:'skin', [P.suckerDk]:'skin',
    [P.brow]:'bone', [P.maw]:'skin', [P.beak]:'bone',
    [P.disc]:'stone', [P.discTop]:'stone',
  });

  /* ---------- MANTLE — a large bulbous ovoid mass, pointed at the top (squid-mantle silhouette),
     held low and centered so the tentacle cluster reads first. Built as a stack of rings tapering
     to a blunt point above and a wide flare where the tentacles root below. ---------- */
  {
    const n = 10, ph = Math.PI/n;
    const bands = [
      { y:0.52, rx:0.30, rz:0.32, hex:P.hideDk },   // base flare — where tentacles root
      { y:0.70, rx:0.40, rz:0.42, hex:P.hide },      // widening
      { y:0.98, rx:0.44, rz:0.46, hex:P.mottleA },   // widest — mantle belly
      { y:1.24, rx:0.36, rz:0.38, hex:P.hide },      // narrowing toward the crown
      { y:1.44, rx:0.22, rz:0.24, hex:P.mottleB },   // shoulder of the point
      { y:1.58, rx:0.10, rz:0.11, hex:P.hideDk },    // near-tip
    ];
    const rings = bands.map(b=>ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,1.68,0), P.hideDk);           // the pointed mantle tip
    capFan(rings[0], V(0,0.40,0), P.hideDk, true);          // close the base flare underside

    /* dorsal mottle patches — a few large irregular blotches breaking up the mantle mass */
    const blot=(cy,cz,cx,rw,rh,hex)=>{
      quad(V(cx-rw,cy-rh,cz), V(cx+rw,cy-rh,cz), V(cx+rw*0.7,cy+rh,cz+rh*0.4), V(cx-rw*0.7,cy+rh,cz+rh*0.4), hex, 0.06);
    };
    blot(1.02, 0.40,  0.18, 0.13, 0.16, P.mottleB);
    blot(0.86,-0.36, -0.20, 0.15, 0.14, P.mottleA);
    blot(1.18, 0.10,  0.32, 0.10, 0.12, P.mottleB);
    blot(0.70, 0.30, -0.30, 0.12, 0.12, P.mottleA);
  }

  /* ---------- BROW RIDGE + BEAKED MAW — low on the mantle's front-underside, heavy and sockety.
     NO eye quads: the brow is a dark recessed shape, not a painted eye. ---------- */
  {
    const bz = 0.40, by = 0.62;
    /* heavy brow ridge — a thick dark band across the front-low mantle */
    quad(V(-0.26,by+0.06,bz-0.02), V(0.26,by+0.06,bz-0.02), V(0.22,by+0.16,bz+0.06), V(-0.22,by+0.16,bz+0.06), P.brow, 0.05);
    /* two brow-socket recesses (shape only, dark — the "eyes are sockets not paint" ruling) */
    for(const s of [-1,1]){
      const cx = s*0.15;
      quad(V(cx-0.055,by-0.02,bz+0.03), V(cx+0.055,by-0.02,bz+0.03), V(cx+0.045,by+0.07,bz+0.07), V(cx-0.045,by+0.07,bz+0.07), P.brow, 0.03);
      quad(V(cx-0.035,by+0.01,bz+0.05), V(cx+0.035,by+0.01,bz+0.05), V(cx+0.028,by+0.05,bz+0.08), V(cx-0.028,by+0.05,bz+0.08), P.maw, 0.0);
    }
    /* beaked maw — a hooked dark beak-quad low-center, parrot-beak silhouette */
    const bkTop = V(0, by-0.05, bz+0.10);
    const bkL   = V(-0.10, by-0.14, bz+0.14);
    const bkR   = V( 0.10, by-0.14, bz+0.14);
    const bkTip = V(0, by-0.26, bz+0.20);
    quad(bkTop, bkR, bkTip, bkL, P.maw, 0.04);
    quad(bkL, bkTip, bkR, bkTop, P.beak, 0.06);            // dark beak hook underlay
    quad(V(-0.07,by-0.16,bz+0.15), V(0.07,by-0.16,bz+0.15), V(0,by-0.24,bz+0.19), V(0,by-0.24,bz+0.19), P.beak, 0.05);
  }

  /* ---------- TENTACLES — 8, root at the mantle base flare (y≈0.50), splay out radially, most
     sprawl flat/low onto the disc with curling tips, a few raised higher and curling up/back
     (the "some raised and curling up, some sprawling out" brief). Serpentine tapered tube-chain
     technique per mon-snake.js: a sampled centerline path, ring cross-sections lofted + stitched,
     sucker quads pasted along the underside near the tip. Tentacles stay within/onto r=0.72. ---------- */
  const NT = 8;
  for(let i=0;i<NT;i++){
    const ang = (i/NT)*Math.PI*2 + 0.18;           // rotate off-axis so none point straight at cam
    const dirX = Math.cos(ang), dirZ = Math.sin(ang);
    const raised = (i % 3 === 0);                   // every third tentacle rears up + curls back
    const root = V(dirX*0.24, 0.50, dirZ*0.24);

    /* build a 6-point centerline path per tentacle: root -> reach out -> curl (up or flat-in) */
    const reach = 0.60 + (i%2)*0.05;                 // vary reach length a touch for a natural spread
    let pts;
    if(raised){
      // raised + curling up and back over itself — a tall gesture reading against the mantle
      pts = [
        root,
        V(dirX*0.42, 0.42, dirZ*0.42),
        V(dirX*0.58, 0.55, dirZ*0.58),
        V(dirX*0.60, 0.82, dirZ*0.60),
        V(dirX*0.50, 1.05, dirZ*0.50),
        V(dirX*0.32, 1.16, dirZ*0.32),                 // curling back in over the mantle
        V(dirX*0.18, 1.10, dirZ*0.18),
      ];
    } else {
      // sprawling flat and out, curling at the tip like a resting cephalopod arm on the seabed
      pts = [
        root,
        V(dirX*0.44, 0.26, dirZ*0.44),
        V(dirX*0.62, 0.14, dirZ*0.62),
        V(dirX*(0.60+reach*0.15), 0.075, dirZ*(0.60+reach*0.15)),
        V(dirX*(0.52+reach*0.10), 0.045, dirZ*(0.52+reach*0.10) + (i%2? 0.08:-0.08)),   // curl begins
        V(dirX*(0.40+reach*0.05), 0.035, dirZ*(0.40+reach*0.05) + (i%2? 0.16:-0.16)),   // curling inward
      ];
    }
    const radii = [0.135, 0.115, 0.088, 0.062, 0.040, 0.024, 0.012].slice(0, pts.length);

    /* loft rings along the path (tapered tube-chain) */
    const NSEG = 7;
    const rings = [];
    for(let k=0;k<pts.length;k++){
      const nxt = pts[Math.min(k+1, pts.length-1)];
      const prv = pts[Math.max(k-1, 0)];
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      rings.push(ring(pts[k], axis, radii[k], radii[k]*0.92, NSEG, Math.PI/NSEG + i*0.3));
    }
    const bandHex = (b)=> (b < rings.length/2) ? (i%2? P.hide : P.hideDk) : (i%2? P.mottleA : P.mottleB);
    stitch(rings, bandHex);
    capFan(rings[0], root.clone().add(V(0,-0.03,0)), P.hideDk, true);
    capFan(rings.at(-1), pts.at(-1).clone().addScaledVector(new THREE.Vector3(dirX,0,dirZ), 0.02), P.hideDk);

    /* SUCKERS — small darker-rimmed pale quads along the underside of each tentacle's outer half,
       suggestion not enumeration (a handful per arm reads as "suckered" without over-authoring). */
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
  }

  /* ---------- base disc (Gargantuan: r=0.72 — the biggest base in the roster) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
