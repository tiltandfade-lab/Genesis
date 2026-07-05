/* dev/model-qa/creatures/rlm-grit-locust-cloud.js — GRIT-LOCUST CLOUD (ash realm, Medium swarm, CR 0.25).
   Read: a mutant locust dust-storm swarm — a churning mass of a dozen-plus oversized locust
   bodies clustered into a single swarm token, wings blurred mid-flap, gritty ash-dust trailing
   off the mass, a few individuals clearer at the mass's leading edge to sell "locust" at a glance.
   Whole-object grammar, one merged frame, no anchors. NO eye quads — dark compound-eye domes only.
   Base disc r=0.42 (Medium — swarm token). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGritLocustCloud(){
  /* ---------- PALETTE (VS-desaturated dust-ochre locust body, ash-grit haze, dull wing membrane) ---------- */
  const P = {
    body:0x817048, bodyDk:0x5c5030, bodyLt:0x97875a,
    wing:0x6e6a54, wingDk:0x4a4738, wingLt:0x8a8468,
    grit:0x9a9276, gritDk:0x6e6850,
    leg:0x4a4230, eye:0x201c16,
    disc:0x453f36, discTop:0x534c3d,
  };

  /* ---------- one small locust body-unit builder (reused for the swarm cluster) ---------- */
  function locust(cx, cy, cz, scale, yaw, hex){
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const rot = (x,z)=> V(cx + (x*c - z*s), cy, cz + (x*s + z*c));
    // simple 3-segment body: tail -> thorax -> head, all offset by rotated local coords
    const tail = rot(-0.09*scale, -0.09*scale); tail.y = cy - 0.01*scale;
    const thorax = rot(0, 0); thorax.y = cy + 0.01*scale;
    const head = rot(0.09*scale, 0.10*scale); head.y = cy;
    tube(tail, thorax, 0.028*scale, 0.040*scale, 5, P.body);
    tube(thorax, head, 0.040*scale, 0.024*scale, 5, P.bodyDk, {capB:{hex:P.bodyLt, lift:0.008*scale}});
    /* dark compound-eye domes (no eye quads — small dome blobs read as eyes) */
    const eyeC = rot(0.10*scale, 0.09*scale);
    quad(V(eyeC.x-0.012*scale,eyeC.y+0.01*scale,eyeC.z), V(eyeC.x+0.012*scale,eyeC.y+0.01*scale,eyeC.z),
         V(eyeC.x+0.010*scale,eyeC.y-0.008*scale,eyeC.z+0.006*scale), V(eyeC.x-0.010*scale,eyeC.y-0.008*scale,eyeC.z+0.006*scale), P.eye, 0.05);
    /* blurred mid-flap wings — flat angled quads either side, semi-transparent read via lighter tone */
    for(const side of [-1,1]){
      const wR = rot(side*0.02*scale, -0.02*scale);
      const wTip = V(wR.x + side*0.10*scale*c*0 + side*0.11*scale, wR.y+0.05*scale, wR.z + 0.02*scale);
      quad(V(wR.x,wR.y,wR.z), V(wR.x+side*0.03*scale,wR.y+0.02*scale,wR.z-0.06*scale),
           V(wTip.x,wTip.y,wTip.z), V(wR.x+side*0.02*scale,wR.y-0.01*scale,wR.z+0.05*scale), P.wing, 0.15);
    }
    /* jointed hind legs, small */
    for(const side of [-1,1]){
      const legB = rot(side*0.02*scale, -0.06*scale); legB.y=cy-0.01*scale;
      const legT = V(legB.x+side*0.05*scale, cy-0.05*scale, legB.z-0.04*scale);
      tube(legB, legT, 0.008*scale, 0.003*scale, 3, P.leg);
    }
  }

  /* ---------- SWARM CLUSTER — a dozen-plus locusts clustered densely into one mass, denser/clearer
     at the leading (forward, +z) edge, hazier/blended toward the trailing edge ---------- */
  const cluster = [
    [0.00,0.30, 0.14, 1.15, 0.10],
    [0.12,0.34, 0.06, 1.00, 0.60],
    [-0.13,0.32, 0.08, 1.00,-0.50],
    [0.06,0.26,-0.06, 0.90, 1.20],
    [-0.08,0.28,-0.04, 0.90,-1.00],
    [0.00,0.20,-0.18, 0.80, 0.30],
    [0.16,0.22,-0.14, 0.75, 2.10],
    [-0.17,0.20,-0.16, 0.75,-2.00],
    [0.04,0.38, 0.22, 0.85, -0.20],
    [-0.05,0.16,-0.28, 0.65, 1.60],
    [0.10, 0.14,-0.30, 0.60,-1.60],
    [0.00, 0.42, 0.02, 0.70, 3.00],
    [-0.14,0.12,-0.22, 0.55, 0.80],
  ];
  for(const [x,y,z,scale,yaw] of cluster) locust(x, y, z, scale, yaw, P.body);

  /* trailing ash-dust/grit haze — flat low soft quads billowing off the back of the swarm mass */
  for(let i=0;i<6;i++){
    const t = i/5, x=(t-0.5)*0.3, y=0.10+t*0.10, z=-0.30-t*0.14;
    quad(V(x-0.08,y,z), V(x+0.08,y+0.01,z-0.02), V(x+0.06,y+0.10,z-0.06), V(x-0.06,y+0.09,z-0.04), t<0.5?P.grit:P.gritDk, 0.15);
  }
  /* a few grit motes scattered above the cluster (dust kicked up) */
  for(const [x,y,z] of [[0.08,0.46,0.02],[-0.10,0.44,-0.08],[0.02,0.50,-0.16]]){
    quad(V(x-0.02,y,z), V(x+0.02,y,z), V(x+0.015,y+0.025,z), V(x-0.015,y+0.025,z), P.grit, 0.2);
  }

  /* ---------- base disc (Medium — swarm token: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
