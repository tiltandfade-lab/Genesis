/* dev/model-qa/creatures/npc-priest.js — the priest / acolyte (whole-object NPC).
   npc-role rows 68-69 (Religious Custodian) + 66-67 (Healer or Midwife) = the clergy read, plus
   "Acolyte" appears on the urban enemy table. THE named distinctness check: a priest must NOT read
   as the cultist. The cultist is SINISTER — a deep drawn HOOD casting a face-shadow, a downward
   sacrificial dagger, dark robes. The priest is the opposite register: an OPEN face (no hood — a
   shaved-crown tonsure with a fringe), a bright ceremonial vestment with a contrasting stole
   hanging down the front, and a HOLY SYMBOL held UP and OUT on a raised staff (authored FIRST —
   blessing, not threatening). Warm sanctioned cream-and-gold, not cult-dark. Shared rig/base. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildBase } from '../parts.js';

export function buildPriest(){
  /* ---------- PALETTE (sanctioned warm cream + gold + a coloured stole — bright, not cult-dark) ---------- */
  const P = Object.assign({}, BASE_P, {
    robe:0xcdc2a0, robeDk:0x9c9276, robeLt:0xdcd2b2,        // cream vestment
    stole:0x486a58, stoleDk:0x33503f, stoleLt:0x5a8069,     // green liturgical stole
    gold:0xb2903f, goldDk:0x7c632a, goldLt:0xcaa552,
    skin:0xc49a72, skinDk:0x8a6a4e,
    staff:0x6a5233, staffDk:0x47371f,
    sandal:0x5a4630, sandalDk:0x3d2f1e,
  });

  /* ---------- RIG — upright, serene; standard human proportions ---------- */
  const L = humanoidRig({
    hipY:0.72, waistY:0.80, ribY:0.91, chestY:1.02, shldY:1.10, neckY:1.145,
    jawY:1.175, cheekY:1.25, browY:1.325, crownY:1.415, headTopY:1.475,
  });

  /* ================= THE HOLY-SYMBOL STAFF — authored FIRST, raised in the RIGHT hand and held
     UP-AND-OUT (blessing gesture). A tall staff topped by a radiant sun-disc / sacred sigil. The
     gripping hand derives to a point partway up the shaft. ======================================= */
  const BUTT=V(0.325,0.02,0.14), TIP=V(0.375,1.58,0.20);
  const SDIR=new THREE.Vector3().subVectors(TIP,BUTT).normalize();
  const GRIP=BUTT.clone().addScaledVector(SDIR, 0.72);      // raised grip, near shoulder height
  {
    tube(BUTT, TIP, 0.020,0.018, 6, P.staff, {capA:{hex:P.staffDk}});
    /* the sun-disc symbol at the tip: a flat medallion FACING THE VIEWER (game cam looks from ~+x/+z),
       mounted just above the staff head. Facing the camera — not perpendicular to the canted shaft —
       so it reads as a clean round sun-disc, never a foreshortened twisted ellipse. */
    const C=TIP.clone().add(V(0.0,0.075,0.0));
    const DAXIS=V(0.62,0.30,0.72).normalize();   // medallion normal points up-and-toward the dimetric camera
    const disc=ring(C, DAXIS, 0.078,0.078, 10, 0);
    const hub =ring(C, DAXIS, 0.032,0.032, 10, 0);
    stitch([hub,disc], ()=>P.gold);
    capFan(hub, C.clone().addScaledVector(DAXIS,0.006), P.goldLt);
    /* radiating spokes/rays around the disc, in the medallion plane */
    const su=new THREE.Vector3().crossVectors(DAXIS,V(0,1,0)).normalize();
    const sv=new THREE.Vector3().crossVectors(DAXIS,su).normalize();
    for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, dir=su.clone().multiplyScalar(Math.cos(a)).addScaledVector(sv,Math.sin(a));
      const inr=C.clone().addScaledVector(dir,0.080), out=C.clone().addScaledVector(dir,0.115);
      quad(inr.clone().addScaledVector(DAXIS,-0.006), inr.clone().addScaledVector(DAXIS,0.006),
           out.clone().addScaledVector(DAXIS,0.004), out.clone().addScaledVector(DAXIS,-0.004), P.goldDk, 0.02); }
    /* a short neck-stem connecting the staff head to the medallion (so it doesn't read as floating) */
    tube(TIP, C.clone().addScaledVector(DAXIS,-0.03), 0.014,0.012,5,P.staffDk);
  }

  /* torso — a full cream vestment, wide-cut and flowing (fuller than the commoner's tunic) */
  stack([
    {y:L.hipY,   rx:0.200, rz:0.155, hex:P.robeDk},
    {y:L.waistY, rx:0.180, rz:0.140, hex:P.robe},
    {y:L.ribY,   rx:0.200, rz:0.150, hex:P.robe},
    {y:L.chestY, rx:0.216, rz:0.160, hex:P.robeLt},
    {y:L.shldY,  rx:0.222, rz:0.158, hex:P.robe},
    {y:L.neckY,  rx:0.086, rz:0.080, hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.004}});

  /* long flowing robe skirt to the ankles (cream, wide hem) */
  stack([
    {y:0.16, rx:0.235, rz:0.195, hex:P.robeDk},
    {y:0.34, rx:0.228, rz:0.185, hex:P.robe},
    {y:0.52, rx:0.216, rz:0.172, hex:P.robe},
    {y:L.hipY-0.01, rx:0.198, rz:0.152, hex:P.robeLt},
  ], 8, {});

  /* a gold girdle/cord at the waist */
  { const b1=ring(V(0,0.775,0), V(0,1,0), 0.184,0.144, 8, Math.PI/8);
    const b2=ring(V(0,0.805,0), V(0,1,0), 0.181,0.141, 8, Math.PI/8);
    stitch([b1,b2], ()=>P.gold); }

  /* the STOLE — two coloured liturgical bands hanging down the FRONT from the neck to the hem
     (the clearest not-a-cultist tell: bright colour worn openly on the chest). */
  for(const s of [-1,1]){
    const x=s*0.062;
    quad(V(x-0.028,L.shldY,0.155), V(x+0.028,L.shldY,0.155),
         V(x+0.030,0.40,0.175), V(x-0.030,0.40,0.175), P.stole, 0.03);
    quad(V(x-0.028,L.shldY,0.156), V(x-0.020,L.shldY,0.156),
         V(x-0.022,0.40,0.176), V(x-0.030,0.40,0.176), P.stoleDk, 0.02);  // edge stripe
    /* a small gold cross near the hem of each stole band */
    quad(V(x-0.014,0.46,0.178), V(x+0.014,0.46,0.178), V(x+0.014,0.50,0.178), V(x-0.014,0.50,0.178), P.gold, 0.02);
    quad(V(x-0.022,0.475,0.179), V(x+0.022,0.475,0.179), V(x+0.022,0.489,0.179), V(x-0.022,0.489,0.179), P.gold, 0.02);
  }

  /* head (skin loft; nose ridge; painted eyes) — OPEN face, serene */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.080, rz:0.086, hex:P.skin},
      {y:L.cheekY, rx:0.110, rz:0.106, hex:P.skin},
      {y:L.browY,  rx:0.114, rz:0.105, hex:P.skin},
      {y:L.crownY, rx:0.089, rz:0.081, hex:P.skin},   // crown bare (tonsure) so it stays skin, not hair
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.011), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[1][i].z += 0.021;
    for(let b=0;b<rings.length-1;b++) for(let i=0;i<n;i++){ const i2=(i+1)%n;
      quad(rings[b][i], rings[b][i2], rings[b+1][i2], rings[b+1][i], bands[b].hex, 0.07); }
    capFan(rings[3], V(0, L.headTopY, 0.007), P.skin);
    /* TONSURE: a ring of dark hair fringe round the sides/back only — bare shaved crown on top.
       A single low band of hair at brow height, open across the crown (the monk/priest tell). */
    const hairRing=ring(V(0,L.browY+0.005,0), V(0,1,0), 0.118,0.109, n, ph);
    const hairRing2=ring(V(0,L.browY+0.05,0), V(0,1,0), 0.108,0.099, n, ph);
    stitch([hairRing,hairRing2], ()=>P.robeDk, {0:[1,2],1:[1,2]});   // hair fringe, thinner at the brow-front
  }

  /* arms — RIGHT raises the holy staff (derived to GRIP); LEFT lifts palm-open in blessing */
  {
    const S=V(L.shoulderX, L.shldY-0.01, 0.02), EL=V(0.30,0.98,0.11);
    tube(S,EL,0.076,0.058,6,P.robe,{capB:{hex:P.robe}});
    tube(EL,GRIP,0.056,0.046,6,P.robe,{capB:{hex:P.skin}});          // wide sleeve to the wrist
    tube(GRIP.clone().add(V(-0.04,0.045,-0.02)), GRIP.clone().add(V(0.04,-0.045,0.02)),
         0.046,0.042,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});   // fist on the staff

    /* left arm out, forearm up, palm turned open (blessing) */
    const S2=V(-L.shoulderX, L.shldY-0.01, 0.02), EL2=V(-0.30,0.90,0.10), W2=V(-0.245,0.98,0.20);
    tube(S2,EL2,0.076,0.058,6,P.robe);
    tube(EL2,W2,0.056,0.046,6,P.robe,{capB:{hex:P.skin}});
    /* open palm: a small flat quad + short finger nubs pointing up */
    quad(W2.clone().add(V(-0.05,0,-0.02)), W2.clone().add(V(0.05,0,-0.02)),
         W2.clone().add(V(0.05,0.02,0.05)), W2.clone().add(V(-0.05,0.02,0.05)), P.skin, 0.03);
    tube(W2.clone().add(V(0,0.02,0.02)), W2.clone().add(V(0,0.075,0.03)), 0.038,0.028,6,P.skin,{capB:{hex:P.skinDk}});
  }

  /* legs — hidden mostly under the robe; simple sandalled feet peek out at the hem */
  {
    for(const [fx,toeDir] of [[-0.09,V(0.04,0,1)], [0.10,V(-0.04,0,1)]]){
      stack([
        {y:0.010, rx:0.056, rz:0.066, cx:fx, cz:0.02, hex:P.sandalDk},
        {y:0.045, rx:0.050, rz:0.054, cx:fx, cz:0.02, hex:P.skin},   // bare instep above the sandal sole
      ], 6, {capTop:{hex:P.skin, lift:0.004}});
      const toeA=V(fx,0.038,0.02), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.10), 0.046,0.034,6,P.skin, {capB:{hex:P.skinDk, lift:0.01}, raz:0.038, rbz:0.026});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
