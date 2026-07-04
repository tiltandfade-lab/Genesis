/* dev/model-qa/creatures/mon-erinyes.js — the ERINYES (bespoke WINGED HUMANOID, Medium Fiend).
   docs/CREATURE-MODELS-P2.md Wave 4: a fallen-angel warrior — armored woman with large dark
   feathered wings off the shoulders and a longsword. Ashen desaturated skin, dark mottled armor,
   dark feathered wings (NOT bat-membrane — feathered, per the celestial-corrupted read). Seeds
   the winged-humanoid base (succubus/incubus/cambion lift from it later). NO eye quads (house
   ruling) — a dark helm-shadow recess reads as the socket. Whole-object grammar: one function,
   one geometry frame, no anchors. Medium size: base disc r=0.42. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildErinyes(){
  /* ---------- PALETTE (VS desaturated; ashen skin, dark mottled armor, dark feathered wings) ---------- */
  const P = {
    skin:0x8a7d72, skinDk:0x685d54,                            // ashen, desaturated fallen-angel skin
    armor:0x3c3a3e, armorDk:0x262428, armorLt:0x53505a,        // dark iron-grey armor
    trim:0x6b5a3a, trimDk:0x4a3d28,                            // tarnished bronze trim/rivets
    helm:0x33313a, helmDk:0x201f24,
    wing:0x35322f, wingDk:0x211f1d, wingLt:0x4a453f,           // dark mottled feather mass
    blade:0x8c8f8a, bladeDk:0x5f625e, hilt:0x4a3d28,
    hair:0x2c2723,
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.skin]:'skin', [P.skinDk]:'skin',
    [P.armor]:'metal', [P.armorDk]:'metal', [P.armorLt]:'metal', [P.helm]:'metal', [P.helmDk]:'metal',
    [P.trim]:'metal', [P.trimDk]:'metal',
    [P.wing]:'fur', [P.wingDk]:'fur', [P.wingLt]:'fur',
    [P.blade]:'metal', [P.bladeDk]:'metal', [P.hilt]:'leather',
    [P.hair]:'fur',
  });

  /* ---------- LANDMARKS — upright bipedal spine along +y, facing +z. Medium humanoid, ~1.0u tall. */
  const S = {
    pelvis: V(0, 0.46, 0.00),
    waist:  V(0, 0.58, 0.01),
    chest:  V(0, 0.76, 0.02),
    shldr:  V(0, 0.88, 0.02),
    neck:   V(0, 0.94, 0.02),
    headB:  V(0, 0.98, 0.02),
  };

  /* ---------- TORSO — armored cuirass, one vertical loft, narrower waist / broad chest. ---------- */
  tube(S.pelvis, S.waist, 0.155, 0.130, 8, P.armorDk, {phase:Math.PI/8});
  tube(S.waist,  S.chest, 0.130, 0.175, 8, P.armor,   {phase:Math.PI/8});
  tube(S.chest,  S.shldr, 0.175, 0.150, 8, P.armorLt, {phase:Math.PI/8});
  tube(S.shldr,  S.neck,  0.075, 0.058, 8, P.skin,    {phase:Math.PI/8});

  /* breastplate ridge + bronze trim band at the waist */
  quad(V(-0.09,0.60,0.155), V(0.09,0.60,0.155), V(0.07,0.86,0.165), V(-0.07,0.86,0.165), P.armorLt, 0.05);
  quad(V(-0.155,0.585,0.02), V(0.155,0.585,0.02), V(0.145,0.555,0.10), V(-0.145,0.555,0.10), P.trim, 0.04);

  /* pauldrons — dark armored shoulder caps, slightly flared */
  for(const s of [-1,1]){
    const rt = V(s*0.185, 0.86, 0.01);
    ring(rt, V(0,1,0), 0.085, 0.075, 6, Math.PI/6);
    const rB = ring(rt, V(0,1,0), 0.10, 0.09, 6, Math.PI/6);
    const rT = ring(V(rt.x, rt.y+0.055, rt.z), V(0,1,0), 0.075, 0.065, 6, Math.PI/6);
    stitch([rB, rT], ()=>P.armorDk);
    capFan(rT, V(rt.x, rt.y+0.075, rt.z), P.armorDk);
  }

  /* ---------- HEAD — a grim horned helm shadowing the brow; dark socket recesses (no eye quads). --- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:0.955, cz:0.02, rx:0.078, rz:0.080, hex:P.skin},   // jaw
      {y:1.010, cz:0.02, rx:0.088, rz:0.085, hex:P.skin},   // cranium
      {y:1.055, cz:0.01, rx:0.078, rz:0.070, hex:P.helmDk}, // brow/helm-line
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.075, 0.02), P.helm);

    /* dark socket recesses — carved-in shadow quads, not painted eyes */
    for(const s of [-1,1]){
      quad(V(s*0.052,1.005,0.088), V(s*0.028,1.005,0.092), V(s*0.028,0.985,0.090), V(s*0.052,0.985,0.086), P.skinDk, 0.05);
    }
    /* grim tight mouth line */
    quad(V(-0.028,0.958,0.098), V(0.028,0.958,0.098), V(0.020,0.951,0.096), V(-0.020,0.951,0.096), P.skinDk, 0.03);

    /* two small curling ram-like horns off the brow, a fallen-angel signature */
    for(const s of [-1,1]){
      const hb = V(s*0.055, 1.058, -0.01);
      const hm = V(s*0.085, 1.095, -0.05);
      const ht = V(s*0.075, 1.100, -0.11);
      tube(hb, hm, 0.020, 0.013, 5, P.trimDk);
      tube(hm, ht, 0.013, 0.004, 5, P.trimDk, {capB:{hex:P.trimDk, lift:0.003}});
    }
    /* dark hair sweeping back off the helm-line */
    quad(V(-0.06,1.05,-0.03), V(0.06,1.05,-0.03), V(0.05,0.97,-0.10), V(-0.05,0.97,-0.10), P.hair, 0.05);
  }

  /* ---------- ARMS — one bears the longsword raised, the other rests bare at the side. ---------- */
  {
    const shL = V(-0.205, 0.855, 0.01), shR = V(0.205, 0.855, 0.01);
    /* left arm — hangs down, armored vambrace, small round shield-less gauntlet fist */
    const elbowL = V(-0.235, 0.66, 0.03);
    const handL  = V(-0.215, 0.48, 0.05);
    tube(shL, elbowL, 0.062, 0.048, 6, P.skin);
    tube(elbowL, handL, 0.046, 0.036, 6, P.armorDk, {capB:{hex:P.skinDk, lift:0.02}});

    /* right arm — raised, elbow out and up, gripping the longsword hilt overhead-forward */
    const elbowR = V(0.29, 0.80, 0.16);
    const handR  = V(0.20, 0.92, 0.30);
    tube(shR, elbowR, 0.062, 0.048, 6, P.skin);
    tube(elbowR, handR, 0.046, 0.036, 6, P.skinDk);

    /* LONGSWORD — hilt at handR, blade sweeping up past the head, cross-guard, pommel */
    const guard = V(handR.x-0.02, handR.y+0.02, handR.z+0.02);
    const pommel= V(handR.x+0.03, handR.y-0.05, handR.z-0.03);
    tube(pommel, handR, 0.020, 0.018, 5, P.hilt);
    tube(handR, guard, 0.018, 0.020, 5, P.hilt);
    quad(V(guard.x-0.055,guard.y,guard.z), V(guard.x+0.055,guard.y,guard.z),
         V(guard.x+0.045,guard.y+0.02,guard.z+0.03), V(guard.x-0.045,guard.y+0.02,guard.z+0.03), P.trim, 0.04);
    const bladeMid = V(guard.x+0.02, guard.y+0.42, guard.z+0.10);
    const bladeTip = V(guard.x+0.03, guard.y+0.74, guard.z+0.16);
    tube(guard, bladeMid, 0.028, 0.020, 4, P.blade, {raz:0.010, rbz:0.008});
    tube(bladeMid, bladeTip, 0.020, 0.004, 4, P.bladeDk, {raz:0.008, rbz:0.002, capB:{hex:P.bladeDk, lift:0.004}});
  }

  /* ---------- LEGS — armored greaves, sturdy stance, small clawed sabaton feet. ---------- */
  {
    const leg=(hipX, footZ, hex)=>{
      const hip  = V(hipX, 0.44, 0.00);
      const knee = V(hipX*1.05, 0.24, footZ*0.5+0.02);
      const foot = V(hipX*0.95, 0.03, footZ);
      tube(hip, knee, 0.082, 0.062, 6, hex);
      tube(knee, foot, 0.058, 0.046, 6, P.armorDk, {capB:{hex:P.armorDk, lift:0.01}});
      // clawed sabaton toe
      const toeB = V(foot.x, 0.035, foot.z+0.02);
      const toeT = V(foot.x, 0.012, foot.z+0.09);
      tube(toeB, toeT, 0.030, 0.010, 4, P.armorDk, {capB:{hex:P.trimDk, lift:0.004}});
    };
    leg(-0.095, 0.06, P.armor);
    leg( 0.095, 0.06, P.armor);
  }

  /* ---------- WINGS — the erinyes' signature: large dark FEATHERED wings rising off the shoulder
     blades, half-spread up and back. Feather masses layered as broad quads between bone struts so
     the silhouette reads wide, not sliver-thin — echoes the manticore wing but feathered/mottled
     rather than membrane-smooth, tucked closer to a humanoid's narrower back. ---------- */
  {
    const wing=(side)=>{
      const root = V(side*0.14, 0.82, -0.10);              // shoulder-blade root

      const f1 = V(side*0.40, 1.28, -0.20);                // top spar, arcs above the head
      const f2 = V(side*0.58, 1.08, -0.38);
      const f3 = V(side*0.62, 0.80, -0.52);
      const f4 = V(side*0.50, 0.54, -0.58);                // bottom spar, trailing toward the hip

      const shoulder = V(side*0.20, 0.94, -0.16);
      tube(root, shoulder, 0.045, 0.034, 5, P.wingDk);
      tube(shoulder, f1, 0.034, 0.010, 5, P.wingDk, {capB:{hex:P.wingDk, lift:0.004}});
      tube(shoulder, f2, 0.032, 0.009, 5, P.wingDk, {capB:{hex:P.wingDk, lift:0.004}});
      tube(shoulder, f3, 0.028, 0.008, 4, P.wingDk, {capB:{hex:P.wingDk, lift:0.003}});
      tube(shoulder, f4, 0.024, 0.007, 4, P.wingDk, {capB:{hex:P.wingDk, lift:0.003}});

      quad(shoulder, f1, f2, shoulder, P.wing, 0.10);
      quad(shoulder, f2, f3, shoulder, P.wingLt, 0.10);
      quad(shoulder, f3, f4, shoulder, P.wing, 0.10);
      const hTrail = V(side*0.28, 0.62, -0.42);
      quad(shoulder, f4, hTrail, root, P.wingDk, 0.10);

      /* layered feather-tuft ridges along the leading edge — the feathered (not membrane) read */
      const rim = [f1,f2,f3,f4];
      for(let i=0;i<rim.length-1;i++){
        const a=rim[i], b=rim[i+1];
        const mid = V((a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2);
        const dip = V(mid.x, mid.y-0.05, mid.z-0.02);
        quad(a, b, dip, dip, P.wingDk, 0.08);
        const tuftTip = V(mid.x*1.06, mid.y+0.05, mid.z-0.03);
        quad(a, b, tuftTip, tuftTip, P.wingLt, 0.06);
      }
    };
    wing(-1); wing(1);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.040,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.043,0), P.discTop);
  }
}
