/* dev/model-qa/creatures/rlm-chain-bound-barrow-ghast.js — the CHAIN-BOUND BARROW GHAST
   (lost-world, Medium undead, CR 2). A ravenous ghast that once served the king's table — rotted
   court finery clings to a gaunt crouched frame, and a length of rusted CHAIN still loops one
   wrist and trails behind, the tell that it was bound before it turned. Whole-object grammar: one
   function, one frame, no anchors. Crouched predatory posture (ghasts stalk on all-fours-ready
   haunches), clawed hands, a lank hollow-cheeked head, NO eye quads (sockets only). Palette:
   grey-green rotted flesh, filthy court-red/gold rag finery, dull iron chain. Lost-world register:
   tomb-grave-dust rather than swamp. Medium size, base disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildChainBoundBarrowGhast(){
  /* ---------- PALETTE (grey-green rotted flesh; filthy court-red/gold rag; dull iron) ---------- */
  const P = {
    skin:0x7d8468, skinDk:0x565d45, skinLt:0x969c78,
    rag:0x6b3a34, ragDk:0x4a2622, gold:0x8a7331, goldDk:0x5f4f22,
    chain:0x625c50, chainDk:0x3f3a30,
    claw:0x231f18, mouth:0x140f0a, socket:0x120d09,
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- RIG — a crouched predatory stance, weight forward on bent haunches ---------- */
  const L = {
    hipY:0.52, waistY:0.60, chestY:0.72, shldY:0.80, neckY:0.835,
    hipHalf:0.10, shoulderX:0.20,
    jawY:0.865, cheekY:0.925, browY:0.985, crownY:1.05, topY:1.09,
  };
  const crouch = (p) => {
    const t = Math.max(0, p.y - L.hipY);
    return V(p.x, p.y - t*0.02, p.z + t*0.16);   // forward-leaning crouch, mild
  };

  /* ===== TORSO — gaunt, torn court-red rag over grey-green rot ===== */
  stack([
    {y:L.hipY,   rx:0.150, rz:0.120, hex:P.ragDk},
    {y:L.waistY, rx:0.128, rz:0.100, hex:P.rag},
    {y:L.chestY, rx:0.155, rz:0.118, hex:P.rag},
    {y:L.shldY,  rx:0.160, rz:0.110, hex:P.ragDk},
    {y:L.neckY,  rx:0.060, rz:0.056, hex:P.skinDk},
  ], 8, {xform:crouch, capTop:{hex:P.skinDk, lift:0.004}});

  /* a tattered gold sash — the last hint of court livery, hanging loose and torn */
  {
    const a=crouch(V(-0.10,L.chestY+0.02,0.12)), b=crouch(V(0.09,L.hipY-0.03,0.10));
    tube(a,b,0.030,0.020,5,P.gold,{capA:{hex:P.goldDk},capB:{hex:P.goldDk}});
  }
  /* ragged hem, uneven torn strips at the waist */
  {
    const n=7, ph=Math.PI/n;
    const top=ring(V(0,L.hipY-0.01,0), V(0,1,0), 0.152, 0.122, n, ph).map(crouch);
    const hemY=[0.30,0.24,0.34,0.20,0.28,0.22,0.32];
    for(let i=0;i<n;i++){
      const i2=(i+1)%n, t=ph+(i/n)*Math.PI*2;
      const hem0=crouch(V(Math.cos(t)*0.19, hemY[i], 0.14+Math.sin(t)*0.15));
      const t2=ph+(i2/n)*Math.PI*2;
      const hem1=crouch(V(Math.cos(t2)*0.19, hemY[i2], 0.14+Math.sin(t2)*0.15));
      quad(top[i], top[i2], hem1, hem0, i&1?P.rag:P.ragDk, 0.06);
    }
  }

  /* ===== HEAD — lank, hollow-cheeked, socketed (no eye quads), a wide predatory maw ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.072, rz:0.078, hex:P.skin},
      {y:L.cheekY, rx:0.095, rz:0.092, hex:P.skin},
      {y:L.browY,  rx:0.098, rz:0.088, hex:P.skinDk},
      {y:L.crownY, rx:0.080, rz:0.072, hex:P.skinDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.topY,0.006), P.skinDk);
    /* deep dark sockets — hollow, no lens/quad face read, just sunk pits */
    for(const s of [-1,1]){
      const ex=s*0.038, ey=L.browY-0.01, ez=0.075;
      quad(V(ex-0.024,ey+0.018,ez), V(ex+0.024,ey+0.018,ez), V(ex+0.020,ey-0.020,ez-0.01), V(ex-0.020,ey-0.020,ez-0.01), P.socket, 0.0);
    }
    /* wide predatory maw, slack open, dark */
    quad(V(-0.044,L.jawY-0.010,0.062), V(0.044,L.jawY-0.010,0.062), V(0.036,L.jawY-0.052,0.070), V(-0.036,L.jawY-0.052,0.070), P.mouth, 0.0);
    tube(V(-0.058,L.jawY-0.02,0.02), V(0.058,L.jawY-0.02,0.02), 0.017,0.017,5,P.skinDk);
  }

  /* ===== ARMS — gaunt, clawed hands; RIGHT wrist wrapped in the rusted chain that trails behind ===== */
  {
    const Ss=(x)=>crouch(V(x,L.shldY-0.01,0.02));
    /* RIGHT — reaching forward-low, predatory, chain-wrapped wrist */
    const S=Ss(L.shoulderX*0.9), E=crouch(V(0.26,0.66,0.22)), W=crouch(V(0.30,0.50,0.40));
    tube(S,E,0.052,0.042,6,P.ragDk); tube(E,W,0.040,0.032,6,P.skin);
    blob(W.x,W.y,W.z,0.038,0.032,0.038,P.skin,6,4);
    const fanR=[V(-0.3,-0.2,1),V(-0.1,0.05,1),V(0.1,0.1,1),V(0.3,-0.1,1)];
    for(const d of fanR){ const dn=d.clone().normalize(); const tip=W.clone().addScaledVector(dn,0.09); tube(W,tip,0.013,0.007,4,P.skin,{capB:{hex:P.claw}}); }
    /* the chain — looped at the wrist, several dull-iron links trailing back to the ground */
    {
      const pts=[W, W.clone().add(V(0.02,-0.10,-0.05)), W.clone().add(V(-0.02,-0.22,-0.16)), W.clone().add(V(0.03,-0.34,-0.30)), V(0.05,0.03,-0.55)];
      for(let i=0;i<pts.length-1;i++){
        const a=pts[i], b=pts[i+1];
        tube(a,b,0.020,0.018,5, i%2?P.chain:P.chainDk);
        blob(b.x,b.y,b.z,0.024,0.020,0.024, i%2?P.chainDk:P.chain, 5,3);
      }
    }
    /* LEFT — hangs low, clawed */
    const S2=Ss(-L.shoulderX*0.9), E2=crouch(V(-0.24,0.62,0.12)), W2=crouch(V(-0.22,0.44,0.14));
    tube(S2,E2,0.052,0.042,6,P.ragDk); tube(E2,W2,0.040,0.032,6,P.skin);
    for(const dx of [-0.02,0,0.02]) tube(W2, W2.clone().add(V(dx,-0.08,0.05)), 0.014,0.008,4,P.skin,{capB:{hex:P.claw}});
  }

  /* ===== LEGS — bent haunches (crouched-ready), clawed feet ===== */
  {
    const hipL=crouch(V(-L.hipHalf,L.hipY-0.01,0.0)), kneeL=V(-0.15,0.30,0.10), ankL=V(-0.14,0.09,0.02);
    tube(hipL,kneeL,0.062,0.046,6,P.skinDk); tube(kneeL,ankL,0.044,0.032,6,P.skin);
    const hipR=crouch(V(L.hipHalf,L.hipY-0.01,0.0)), kneeR=V(0.16,0.32,0.12), ankR=V(0.15,0.09,0.0);
    tube(hipR,kneeR,0.062,0.046,6,P.skinDk); tube(kneeR,ankR,0.044,0.032,6,P.skin);
    for(const [ank,d] of [[ankL,V(0.05,0,1)],[ankR,V(-0.05,0,1)]]){
      const dn=d.clone().normalize();
      tube(V(ank.x,0.05,ank.z), V(ank.x,0.05,ank.z).clone().addScaledVector(dn,0.11), 0.036,0.020,5,P.skinDk,{raz:0.03,rbz:0.016});
      const toe=V(ank.x,0.05,ank.z).addScaledVector(dn,0.11);
      for(const off of [-0.02,0.02]) tube(toe.clone().add(V(off,0,0)), toe.clone().add(V(off,0,0.03)), 0.010,0.006,4,P.claw);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.05,0),  V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.052,0), P.discTop);
  }
}
