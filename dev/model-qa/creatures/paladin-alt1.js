/* dev/model-qa/creatures/paladin-alt1.js — the ORIGINAL paladin, KEPT as an alt (Alt policy, F3 2026-07-04).
   Adam rated the OG paladin good; when F3 re-posed it into an oath-guard ready stance (new PRIMARY in
   paladin.js — shield raised forward, hammer cocked at the shoulder, staggered stance), this upright
   parade-rest stance (hammer vertical, shield at the side, feet square) is preserved verbatim as
   `paladin-alt1` so both render on the alts sheet. Identical geometry to the pre-F3 paladin.js; only
   the export name differs.

   Same whole-object grammar as humanoid.js: the ENTIRE creature is one function of shared primitives,
   every vertex in one model frame, no anchors. The TOWER SHIELD is authored first (left arm derives to
   its back face) and the WARHAMMER second (right fist derives to its grip). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildPaladinAlt1(){
  /* ---------- PALETTE (VS desaturated) ---------- */
  const P = {
    steel:0x9aa1a6, steelDk:0x6b7176, steelLt:0xbcc2c6,
    gold:0xb08d46, goldDk:0x7d6432,
    tabard:0x7a2f2b, tabardDk:0x5c2421, tabardLt:0x8f3a34,
    plume:0xc9bfa2, plumeDk:0x968c72,
    leather:0x4e3d2a, leatherDk:0x362a1c,
    skin:0xc49a72, skinDk:0x8a6a4e, eye:0x1a1512,
    wood:0x5a4326, woodDk:0x3f2f1a,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS (broad, square, upright — heavier than the base humanoid) ---------- */
  const L = {
    hipY:0.72, waistY:0.81, ribY:0.94, chestY:1.05, shldY:1.135, neckY:1.170,
    hipHalf:0.125, shoulderX:0.275,
    jawY:1.20, cheekY:1.275, browY:1.345, crownY:1.430, headTopY:1.480,
  };

  /* TOWER SHIELD FIRST (left side) — a large kite shape angled out-forward; the left hand meets
     its back face. Authored before any arm geometry per the doctrine. */
  const SC = V(-0.420, 0.790, 0.130);                    /* shield center — lowered ~0.08 to sit at forearm height beside the torso, clear of shoulder + hip */
  const SN = V(-0.86, 0.05, 0.42).normalize();            /* shield normal: out-left, slightly forward */
  {
    const su = V(0,1,0).clone().sub(SN.clone().multiplyScalar(SN.y)).normalize();  /* "up" on the shield face */
    const sr = new THREE.Vector3().crossVectors(SN, su).normalize();               /* "right" on the shield face */
    /* kite outline: wide shoulders tapering to a point at the bottom — TOWER-sized, reaching from
       above the shoulder down past the hip so it reads unmistakably bigger than a buckler/targe. */
    const kite = (w,h) => [
      SC.clone().addScaledVector(su, 0.300*h).addScaledVector(sr, 0*w),           /* top */
      SC.clone().addScaledVector(su, 0.190*h).addScaledVector(sr, 0.195*w),       /* upper right */
      SC.clone().addScaledVector(su,-0.075*h).addScaledVector(sr, 0.170*w),       /* lower right */
      SC.clone().addScaledVector(su,-0.375*h).addScaledVector(sr, 0*w),           /* point */
      SC.clone().addScaledVector(su,-0.075*h).addScaledVector(sr,-0.170*w),       /* lower left */
      SC.clone().addScaledVector(su, 0.190*h).addScaledVector(sr,-0.195*w),       /* upper left */
    ];
    const front = kite(1,1).map(p=>p.clone().addScaledVector(SN,0.022));
    const back  = kite(0.94,0.96).map(p=>p.clone().addScaledVector(SN,-0.018));
    /* rim: stitch the polygon loop between front and back */
    const n = front.length;
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(back[i], back[i2], front[i2], front[i], P.steelDk, 0.04);
    }
    /* faces via a fan from the shield center */
    const cF = SC.clone().addScaledVector(SN,0.028), cB = SC.clone().addScaledVector(SN,-0.024);
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], cF, cF, P.tabard, 0.05);
      quad(cB, cB, back[i2], back[i], P.tabardDk, 0.05);
    }
    /* gold rim trim (thin band riding the front edge) */
    const frontIn = kite(0.86,0.86).map(p=>p.clone().addScaledVector(SN,0.026));
    for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(front[i], front[i2], frontIn[i2], frontIn[i], P.gold, 0.03);
    }
    /* central steel boss */
    tube(SC.clone().addScaledVector(SN,0.03), SC.clone().addScaledVector(SN,0.085),
         0.058, 0.032, 8, P.steel, {capB:{hex:P.steel, lift:0.015}});
  }

  /* WARHAMMER SECOND — held upright/raised beside the body; the right fist derives from GRIP.
     z pushed forward (0.150->0.260 at butt, 0.055->0.230 at top) so the haft clears the torso's
     z-envelope (chest/shoulder reach z=+-0.15..0.18) — previously the haft's z sat INSIDE that
     range at every torso-crossing height, reading as a skewer through the chest in side view. */
  const H_BUTT = V(0.310, 0.640, 0.260), H_TOP = V(0.350, 1.520, 0.230);
  const AXIS = new THREE.Vector3().subVectors(H_TOP, H_BUTT).normalize();
  const GRIP = H_BUTT.clone().addScaledVector(AXIS, 0.30);
  {
    tube(H_BUTT, H_BUTT.clone().addScaledVector(AXIS,0.09), 0.022,0.020,6,P.leatherDk,{capA:{hex:P.gold, lift:0.018}});
    tube(H_BUTT.clone().addScaledVector(AXIS,0.09), GRIP.clone().addScaledVector(AXIS,-0.075), 0.020,0.020,6,P.wood);
    tube(GRIP.clone().addScaledVector(AXIS,-0.075), GRIP.clone().addScaledVector(AXIS,0.075), 0.023,0.023,6,P.leather);
    tube(GRIP.clone().addScaledVector(AXIS,0.075), H_TOP.clone().addScaledVector(AXIS,-0.13), 0.019,0.024,6,P.wood);
    tube(H_TOP.clone().addScaledVector(AXIS,-0.13), H_TOP.clone().addScaledVector(AXIS,-0.02), 0.024,0.044,6,P.steelDk);
    /* hammer head: a BIG squared steel block on one side, a stout spike on the other — sized to
       read clearly as a war-hammer head next to the fist, not a lollipop.
       FIX: the block/spike used to start at du=0.03 / du=-0.025 respectively, leaving a ~0.055-wide
       gap straddling the haft AXIS itself (du=0) with no geometry — the haft tip poked into that
       void, reading as detached/floating. A socket collar (centered on the axis) now bridges the
       neck's top cap to the head, and both the block and spike bases now extend IN to du=0 so they
       fully close around the axis with no seam. */
    const up=V(0,1,0);
    const u=new THREE.Vector3().crossVectors(up,AXIS).normalize();
    const w=new THREE.Vector3().crossVectors(AXIS,u).normalize();
    const HC=H_TOP.clone().addScaledVector(AXIS,0.03);
    /* socket collar: a short steel tube centered ON the axis, bridging the neck's top cap
       (H_TOP - AXIS*0.02, radius 0.044) up to the head's mounting plane (HC - AXIS*0.078) so
       there is continuous steel from haft to head with no gap on either side of the axis. */
    tube(H_TOP.clone().addScaledVector(AXIS,-0.02), HC.clone().addScaledVector(AXIS,-0.078),
         0.044,0.052,6,P.steelDk);
    /* block face (the +u side) — near face pulled in to du=0 so it meets the collar/axis flush */
    const blk=(du,dAx,dw)=>HC.clone().addScaledVector(u,du).addScaledVector(AXIS,dAx).addScaledVector(w,dw);
    const b=[
      blk(0.0,-0.078,-0.068), blk(0.0,0.078,-0.068), blk(0.0,0.078,0.068), blk(0.0,-0.078,0.068),
      blk(0.175,-0.070,-0.062), blk(0.175,0.070,-0.062), blk(0.175,0.070,0.062), blk(0.175,-0.070,0.062),
    ];
    quad(b[0],b[1],b[2],b[3],P.steelDk,0.03);           /* inner face */
    quad(b[4],b[7],b[6],b[5],P.steel,0.03);             /* outer face */
    quad(b[0],b[4],b[5],b[1],P.steel,0.03);             /* top */
    quad(b[3],b[2],b[6],b[7],P.steel,0.03);             /* bottom */
    quad(b[1],b[5],b[6],b[2],P.steel,0.03);             /* +w side */
    quad(b[0],b[3],b[7],b[4],P.steel,0.03);             /* -w side */
    /* back spike (the -u side) — base pulled out to du=0 so it meets the collar/axis flush too */
    const spTip = HC.clone().addScaledVector(u,-0.205);
    const spBase=[ HC.clone().addScaledVector(u,0.0).addScaledVector(w,-0.052),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(w, 0.052),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,0.062),
                   HC.clone().addScaledVector(u,0.0).addScaledVector(AXIS,-0.062) ];
    for(let i=0;i<4;i++){ const i2=(i+1)%4; quad(spBase[i],spBase[i2],spTip,spTip,P.steelDk,0.03); }
  }

  /* trunk — the cuirass: broad, square, heavy taper hips->shoulders (steel, no cloth showing) */
  stack([
    {y:L.hipY,   rx:0.220, rz:0.165, hex:P.steelDk},
    {y:L.waistY, rx:0.195, rz:0.150, hex:P.steel},
    {y:L.ribY,   rx:0.225, rz:0.168, hex:P.steel},
    {y:L.chestY, rx:0.260, rz:0.180, hex:P.steelLt},
    {y:L.shldY,  rx:0.270, rz:0.172, hex:P.steel},
    {y:L.neckY,  rx:0.095, rz:0.088, hex:P.steelDk},
  ], 8, {capTop:{hex:P.steelDk, lift:0.005}});

  /* raised breastplate ridge (a proud vertical spine down the front, +z) — reads as shaped plate */
  {
    const rows=[[L.ribY,0.170],[0.995,0.183],[L.chestY,0.182]];
    for(const [y,z] of rows) quad(V(-0.028,y-0.02,z), V(0.028,y-0.02,z), V(0.028,y+0.02,z+0.014), V(-0.028,y+0.02,z+0.014), P.steelLt, 0.03);
  }

  /* waist/faulds — layered steel skirt plates over the hips */
  stack([
    {y:0.50, rx:0.235, rz:0.185, hex:P.steelDk},
    {y:0.60, rx:0.225, rz:0.178, hex:P.steel},
    {y:L.hipY, rx:0.218, rz:0.168, hex:P.steel},
  ], 8, {});

  /* belt */
  stack([
    {y:0.775, rx:0.202, rz:0.158, hex:P.leather},
    {y:0.830, rx:0.198, rz:0.155, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.04,0.782,0.162), V(0.04,0.782,0.162), V(0.04,0.828,0.158), V(-0.04,0.828,0.158), P.gold, 0.02);

  /* TABARD — flat panel hanging over the cuirass front, gold hem, no cross (paladin order sigil
     kept simple: a plain deep-oxblood field so the read stays "heraldic surcoat", not "cleric") */
  {
    const fp=[[1.06,0.185],[0.87,0.195],[0.66,0.208],[0.46,0.220],[0.32,0.226]];
    for(let i=0;i<fp.length-1;i++){
      const [y1,z1]=fp[i], [y2,z2]=fp[i+1];
      quad(V(-0.115,y2,z2), V(0.115,y2,z2), V(0.115,y1,z1), V(-0.115,y1,z1), i%2?P.tabard:P.tabardDk, 0.04);
    }
    /* gold hem band on the tabard bottom edge */
    const [hy,hz]=fp.at(-1);
    quad(V(-0.115,hy-0.018,hz-0.004), V(0.115,hy-0.018,hz-0.004), V(0.115,hy+0.006,hz+0.002), V(-0.115,hy+0.006,hz+0.002), P.gold, 0.02);
  }

  /* SHOULDER PAULDRONS — big flared plates, bigger than the fighter's small steel domes */
  for(const s of [-1,1]){
    const pivot=V(s*L.shoulderX, L.shldY+0.01, 0.015);
    const tilt=p=>{ const q=p.clone().sub(pivot); q.applyAxisAngle(V(0,0,1), -s*0.32); return q.add(pivot); };
    stack([
      {y:L.shldY-0.05, rx:0.145, rz:0.150, cx:pivot.x, cz:pivot.z, hex:P.steelDk},
      {y:L.shldY+0.02, rx:0.130, rz:0.135, cx:pivot.x, cz:pivot.z, hex:P.steel},
      {y:L.shldY+0.095,rx:0.095, rz:0.100, cx:pivot.x, cz:pivot.z, hex:P.steelLt},
    ], 8, {xform:tilt, capTop:{hex:P.steelLt, lift:0.03}});
    /* a flared lame skirt off the underside of the pauldron for a bigger silhouette */
    const flareBase=V(pivot.x + s*0.10, L.shldY-0.05, pivot.z);
    quad(tilt(flareBase.clone().add(V(s*-0.02,0,-0.06))), tilt(flareBase.clone().add(V(s*0.10,0,-0.05))),
         tilt(flareBase.clone().add(V(s*0.13,-0.09,-0.03))), tilt(flareBase.clone().add(V(s*-0.02,-0.07,-0.04))), P.steelDk, 0.05);
  }

  /* head (skin loft under the open visor slit; nose pushed). FRONT verts are 1 & 2.
     Face eyes REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so
     just get rid of them") — this underlying face sits inside the closed helm below anyway;
     the helm's own visor slit (a painted dark band, not eyes) is unaffected. See
     dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.082, rz:0.088, hex:P.skin},
      {y:L.cheekY, rx:0.108, rz:0.104, hex:P.skin},
      {y:L.browY,  rx:0.112, rz:0.102, hex:P.skin},
      {y:L.crownY, rx:0.086, rz:0.078, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.010), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.018;
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07);
      }
    }
    capFan(rings[3], V(0, L.headTopY-0.02, 0.006), P.skinDk);
  }

  /* CLOSED HELM — a full steel shell over the head, a narrow horizontal visor slit, then a tall
     crest/plume rising off the crown. This is the unmistakable paladin silhouette topper. */
  {
    const n=10, ph=Math.PI/n;
    /* gorget collar (steel throat guard, wider than the neck) */
    stack([
      {y:L.neckY-0.01, rx:0.115, rz:0.108, hex:P.steelDk},
      {y:L.jawY-0.03,  rx:0.122, rz:0.112, hex:P.steel},
    ], n, {});
    /* the helm shell: bulges out past the skull radius all around, fully enclosing the face
       except a visor slit painted dark across the brow band */
    const bands=[
      {y:L.jawY-0.02,   rx:0.118, rz:0.122, hex:P.steel},
      {y:L.cheekY+0.005,rx:0.140, rz:0.136, hex:P.steel},
      {y:L.browY+0.01,  rx:0.146, rz:0.134, hex:P.steel},
      {y:L.crownY+0.02, rx:0.122, rz:0.112, hex:P.steelLt},
      {y:L.headTopY+0.03,rx:0.078, rz:0.070, hex:P.steelLt},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.0), V(0,1,0), b.rx, b.rz, n, ph));
    const visorCols=[0,1,9];    /* the wide front arc at band-row 2 (cheek->brow) gets the dark slit */
    for(let bnd=0;bnd<rings.length-1;bnd++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n, isVisor=(bnd===1 && visorCols.includes(i));
        quad(rings[bnd][i], rings[bnd][i2], rings[bnd+1][i2], rings[bnd+1][i], isVisor?P.eye:bands[bnd].hex, isVisor?0.0:0.05);
      }
    }
    capFan(rings.at(-1), V(0,L.headTopY+0.11,0.0), P.steelLt);
    /* thin visor slit lines (a couple of raised bar quads over the dark band for a grille read) */
    for(const dz of [0.145,0.125]){
      quad(V(-0.06,L.browY-0.01,dz), V(0.06,L.browY-0.01,dz), V(0.06,L.browY+0.01,dz), V(-0.06,L.browY+0.01,dz), P.steelDk, 0.03);
    }

    /* CREST/PLUME — a MOHAWK-style fin: thin left-right (x), long front-to-back (z) and tall (y).
       This is the shape brief distinguishes explicitly from the mage's cone (which is thin in
       BOTH x/z and round in cross-section) — front view reads as a narrow blade, side view reads
       as a long sweeping fin arcing back off the crown. */
    const crestBase=V(0, L.headTopY+0.05, 0.0);
    const crest=[
      {t:0.0,  y:0.00, zF:0.115, zB:-0.135, h:0.010},
      {t:0.25, y:0.10, zF:0.100, zB:-0.150, h:0.016},
      {t:0.5,  y:0.20, zF:0.075, zB:-0.155, h:0.020},
      {t:0.75, y:0.29, zF:0.045, zB:-0.140, h:0.016},
      {t:1.0,  y:0.36, zF:0.010, zB:-0.100, h:0.008},
    ];
    /* ridge line (top edge) and base line (root, at the skull) for each cross-section */
    const ridge=[], rootF=[], rootB=[];
    for(const c of crest){
      ridge.push(V(crestBase.x, crestBase.y+c.y, crestBase.z));
      rootF.push(V(crestBase.x, crestBase.y+c.y*0.15, crestBase.z+c.zF));
      rootB.push(V(crestBase.x, crestBase.y+c.y*0.15, crestBase.z+c.zB));
    }
    /* two thin side faces (a blade fin: front slope + back slope), each with x-thickness `h` */
    for(let i=0;i<crest.length-1;i++){
      const h0=crest[i].h, h1=crest[i+1].h;
      const fA=rootF[i], fB=rootF[i+1], rA=ridge[i], rB=ridge[i+1];
      /* front slope, both faces (±x) */
      quad(fA.clone().add(V(h0,0,0)), fB.clone().add(V(h1,0,0)), rB.clone().add(V(h1,0,0)), rA.clone().add(V(h0,0,0)), P.plume, 0.04);
      quad(rA.clone().add(V(-h0,0,0)), rB.clone().add(V(-h1,0,0)), fB.clone().add(V(-h1,0,0)), fA.clone().add(V(-h0,0,0)), P.plume, 0.04);
      /* back slope, both faces (±x) */
      const bA=rootB[i], bB=rootB[i+1];
      quad(rA.clone().add(V(h0,0,0)), rB.clone().add(V(h1,0,0)), bB.clone().add(V(h1,0,0)), bA.clone().add(V(h0,0,0)), P.plumeDk, 0.04);
      quad(bA.clone().add(V(-h0,0,0)), bB.clone().add(V(-h1,0,0)), rB.clone().add(V(-h1,0,0)), rA.clone().add(V(-h0,0,0)), P.plumeDk, 0.04);
      /* thin cap along the ridge top so the fin reads solid, not paper */
      quad(rA.clone().add(V(-h0,0,0)), rA.clone().add(V(h0,0,0)), rB.clone().add(V(h1,0,0)), rB.clone().add(V(-h1,0,0)), P.plume, 0.02);
    }
    /* pinch the tip closed */
    const tipR=ridge.at(-1), tipFh=crest.at(-1).h;
    quad(rootF.at(-1).clone().add(V(tipFh,0,0)), rootB.at(-1).clone().add(V(tipFh,0,0)),
         rootB.at(-1).clone().add(V(-tipFh,0,0)), rootF.at(-1).clone().add(V(-tipFh,0,0)), P.plumeDk, 0.03);
  }

  /* RIGHT ARM — steel pauldron sleeve rising to the warhammer; fist DERIVED from GRIP.
     Elbow placed on the S->GRIP line (lerp + outward bend) exactly like the barbarian fix, so the
     forearm always tracks toward the actual grip regardless of where the haft ends up. The
     forearm's end point is pinned to the fist's OWN near-cap so there is no gap between the steel
     vambrace and the gauntlet fist — they meet at the same vertex ring. */
  {
    const S=V(L.shoulderX, L.shldY-0.02, 0.02);
    const fistNear=GRIP.clone().addScaledVector(AXIS,-0.055);
    const E=S.clone().lerp(fistNear, 0.5).add(V(0.045,0.0,0.03));
    tube(S,E,0.088,0.070,6,P.steel);
    tube(E,fistNear,0.062,0.054,6,P.steel);
    tube(fistNear, GRIP.clone().addScaledVector(AXIS,0.055),
         0.054,0.048,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* LEFT ARM — down and out to the shield's back face */
  {
    const S2=V(-L.shoulderX, L.shldY-0.02, 0.015);
    const W2=SC.clone().addScaledVector(SN,-0.045);
    const E2=V(-0.335, 0.955, 0.045);
    tube(S2,E2,0.086,0.068,6,P.steel);
    tube(E2,W2,0.060,0.050,6,P.steel);
    tube(W2.clone().add(V(0.015,0.045,-0.015)), W2.clone().add(V(-0.015,-0.045,0.015)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — steel greaves + sabatons, upright square stance */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.02, 0.01), kneeL=V(-0.155,0.40,0.05), ankL=V(-0.165,0.085,0.03);
    const hipR=V( L.hipHalf, L.hipY-0.02, 0.00), kneeR=V( 0.175,0.40,-0.03), ankR=V( 0.185,0.085,-0.05);
    tube(hipL,kneeL,0.098,0.070,6,P.steelDk);
    tube(kneeL,ankL,0.066,0.050,6,P.steel);
    tube(hipR,kneeR,0.098,0.070,6,P.steelDk);
    tube(kneeR,ankR,0.066,0.050,6,P.steel);
    /* knee cops (round steel discs at the knee joints) */
    for(const k of [kneeL,kneeR]) tube(k.clone().add(V(0,0.015,-0.01)), k.clone().add(V(0,0.015,0.045)), 0.052,0.044,8,P.steelLt,{capB:{hex:P.steelLt,lift:0.01}});
    for(const [ank,toeDir] of [[ankL,V(0.06,0,1)], [ankR,V(0.85,0,0.30).normalize()]]){
      stack([
        {y:0.012, rx:0.070, rz:0.078, cx:ank.x, cz:ank.z, hex:P.steelDk},
        {y:0.09,  rx:0.064, rz:0.066, cx:ank.x, cz:ank.z, hex:P.steel},
      ], 6, {capTop:{hex:P.steel, lift:0.008}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.145), 0.058,0.044,6,P.steel, {capB:{hex:P.steel, lift:0.015}, raz:0.050, rbz:0.036});
    }
  }

  /* base disc */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
